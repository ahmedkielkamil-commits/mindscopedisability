import io
import json
import re
from pathlib import Path
import flask_cors
from flask import Flask, request, jsonify, render_template, send_file, Response

from ai_client import callAI
from careNetwork import search_conditions
from docBreakdown import SYSTEM_PROMPT, extract_text_from_file, extract_text_from_pdf, render_slides_to_pdf
from IEP import analyze_iep

app = Flask(__name__, template_folder="Templates")
cors = flask_cors.CORS(app)

# Holds the last generated PDF in memory so the download route can serve it
_last_pdf_bytes: bytes = None


# ---------------------------------------------------------------------------
# Page routes
# ---------------------------------------------------------------------------

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/carenetwork")
def carenetwork_page():
    return render_template("careNetwork.html")

@app.route("/docbreakdown")
def docbreakdown_page():
    return render_template("docBreakDown.html")


@app.route("/iep")
def iep_page():
    return render_template("iep.html")

@app.route("/disabilities")
def disabilities_page():
    return render_template("index.html")

@app.route("/disabilities/detail")
def disabilities_detail_page():
    return render_template("detail.html")

@app.route("/disabilities/data.js")
def disabilities_data():
    # Serve the disabilities JS const so the browser can import it as a script
    js = (Path(__file__).parent / "Templates" / "disabilities.js").read_text(encoding="utf-8")
    return Response(js, mimetype="application/javascript")

@app.route("/disabilities/styles.css")
def disabilities_styles():
    css = (Path(__file__).parent / "Templates" / "styles.css").read_text(encoding="utf-8")
    return Response(css, mimetype="text/css")


# ---------------------------------------------------------------------------
# API — Emergency triage
# ---------------------------------------------------------------------------

EMERGENCY_TRIAGE_PROMPT = """You are an emergency symptom triage assistant for a healthcare navigation platform.
Your job is to analyze a user's symptom description and return a structured emergency guidance response in STRICT JSON only.
You are NOT a doctor, you do NOT diagnose conditions, and you do NOT replace emergency services. You only estimate urgency level and recommend the safest next step based on the symptoms provided.
Your output must always follow this exact JSON structure:
{
  "urgency_level": "E1|E2|E3|E4|E5",
  "label": "Low|Moderate|Urgent|High Urgency|Emergency",
  "message": "short plain-language urgency statement",
  "recommended_actions": [
    "action 1",
    "action 2",
    "action 3"
  ],
  "reasoning": "1-2 sentence explanation of why this urgency level was chosen based only on the described symptoms, without giving a diagnosis",
  "disclaimer": "This is not a medical diagnosis. If symptoms worsen or you feel unsafe, seek immediate medical attention."
}
Urgency scale:
- E5 = Emergency: possible life-threatening situation; advise calling 911 immediately
- E4 = High Urgency: advise going to the emergency room now or seeking immediate in-person care
- E3 = Urgent: advise urgent care or same-day medical attention
- E2 = Moderate: advise scheduling care soon, primary care, or telehealth
- E1 = Low: advise self-monitoring, routine care, or telehealth if needed
Label mapping:
- E5 -> Emergency
- E4 -> High Urgency
- E3 -> Urgent
- E2 -> Moderate
- E1 -> Low
Safety rules:
1. Be conservative. If symptoms could plausibly indicate a severe emergency, choose the safer higher urgency level.
2. Never claim certainty. Do not diagnose, rule out, or confirm a disease.
3. Never say the person is definitely fine.
4. Keep all language simple, direct, and calm.
5. The "message" must be one short sentence in plain language.
6. The "recommended_actions" list must contain 2 to 4 short, concrete, ordered actions.
7. The "reasoning" must be brief and based only on the symptoms described.
8. Do not include any extra keys, markdown, commentary, or formatting outside the JSON object.
9. If the input is unclear, incomplete, or ambiguous, still return valid JSON and choose the safest reasonable urgency level.
10. If the user mentions any of the following or closely related symptoms, strongly prefer E5 unless the description clearly indicates otherwise:
   - chest pain
   - trouble breathing / cannot breathe / shortness of breath
   - stroke symptoms
   - severe bleeding
   - unconsciousness
   - seizure
   - suicidal intent
   - overdose
   - severe allergic reaction
11. If the user appears to describe self-harm, suicide risk, overdose, or immediate danger, return E5 and recommend calling 911 or emergency services immediately.
Style rules:
- Do not use medical jargon when plain language works.
- Do not mention policy, liability, or internal reasoning.
- Do not mention "I am an AI."
- Do not ask follow-up questions.
- Do not output anything except the JSON.

Example of a valid response:

{
  "urgency_level": "E5",
  "label": "Emergency",
  "message": "This may be a life-threatening emergency.",
  "recommended_actions": [
    "Call 911 immediately.",
    "Do not drive yourself unless no other option is available.",
    "Stay with another person if possible."
  ],
  "reasoning": "The symptoms described include chest pain and dizziness, which can sometimes signal a serious emergency and should be evaluated immediately.",
  "disclaimer": "This is not a medical diagnosis. If symptoms worsen or you feel unsafe, seek immediate medical attention."
}"""


@app.route("/api/symptom-triage", methods=["POST"])
def symptom_triage():
    prompt = request.json.get("illness_description", "")
    result = callAI(EMERGENCY_TRIAGE_PROMPT, prompt)
    return jsonify(result)


# ---------------------------------------------------------------------------
# API — Care network search
# ---------------------------------------------------------------------------

@app.route("/api/makeNetwork", methods=["POST"])
def make_network():
    payload = request.json or {}
    location = (payload.get("location") or "").strip()
    if not location:
        return jsonify({"error": "Location is required"}), 400
    raw = payload.get("conditions", payload.get("condition"))
    if raw is None:
        return jsonify({"error": "Missing condition(s)"}), 400
    condition_names = [raw] if isinstance(raw, str) else list(raw)
    if not condition_names:
        return jsonify({"error": "At least one condition required"}), 400
    try:
        results = search_conditions(condition_names, location)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    return jsonify(results)


# ---------------------------------------------------------------------------
# API — IEP analysis: upload PDF / DOCX / TXT → extract text → analyze_iep
# ---------------------------------------------------------------------------

@app.route("/api/analyze-iep", methods=["POST"])
def api_analyze_iep():
    f = request.files.get("file")
    if not f or f.filename == "":
        return jsonify({"error": "No file uploaded. Use form field name 'file'."}), 400

    try:
        data = f.read()
        text = extract_text_from_file(f.filename, data)
    except (ValueError, RuntimeError) as e:
        return jsonify({"error": str(e)}), 400

    if not (text or "").strip():
        return jsonify({"error": "No text could be extracted from the file."}), 400

    try:
        result = analyze_iep(text)
    except ValueError as e:
        return jsonify({"error": str(e)}), 422
    except Exception as e:
        return jsonify({"error": "Analysis failed", "detail": str(e)}), 500

    return jsonify(result)


# ---------------------------------------------------------------------------
# API — Medical breakdown: upload PDFs → extract text → AI slides → PDF
# ---------------------------------------------------------------------------

@app.route("/api/generate-breakdown", methods=["POST"])
def generate_breakdown():
    global _last_pdf_bytes

    files = request.files.getlist("pdfs")
    if not files or files[0].filename == "":
        return jsonify({"error": "No PDF files uploaded"}), 400

    # 1. Extract full raw text from every uploaded PDF
    all_text = ""
    for f in files:
        if not f.filename.lower().endswith(".pdf"):
            return jsonify({"error": f"'{f.filename}' is not a PDF"}), 400
        all_text += extract_text_from_pdf(f.read()) + "\n\n"

    # 2. Send raw text to AI, capped to stay within token limits
    raw = callAI(SYSTEM_PROMPT, all_text[:50_000])

    if isinstance(raw, dict):
        # callAI returned an error dict
        return jsonify(raw), 500

    # Strip markdown fences the AI sometimes adds despite being told not to
    raw = raw.strip()
    raw = re.sub(r"^```[a-z]*\n?", "", raw)
    raw = re.sub(r"\n?```$", "", raw)

    # 3. Parse the AI's JSON response  { "slides": [{ "title": ..., "html": ... }, ...] }
    try:
        slides_map = json.loads(raw)
        slides_list = slides_map["slides"]
    except (json.JSONDecodeError, KeyError) as e:
        return jsonify({"error": "AI returned invalid JSON", "detail": str(e), "raw": raw[:500]}), 500

    titles      = [s["title"] for s in slides_list]
    slide_htmls = [s["html"]  for s in slides_list]

    # 4. Render all slides to a merged PDF and cache the bytes for download
    try:
        buf = render_slides_to_pdf(slide_htmls)
        _last_pdf_bytes = buf.read()
    except RuntimeError as e:
        # Playwright/Chrome not available — still return the slides for display
        _last_pdf_bytes = None
        return jsonify({"slides": slide_htmls, "titles": titles, "pdf_ready": False,
                        "pdf_warning": str(e)})

    return jsonify({"slides": slide_htmls, "titles": titles, "pdf_ready": True})


@app.route("/api/download-breakdown")
def download_breakdown():
    global _last_pdf_bytes
    if not _last_pdf_bytes:
        return "No breakdown PDF available. Generate one first.", 404
    return send_file(
        io.BytesIO(_last_pdf_bytes),
        mimetype="application/pdf",
        as_attachment=True,
        download_name="medical_breakdown.pdf",
    )


if __name__ == "__main__":
    app.run(debug=True)
