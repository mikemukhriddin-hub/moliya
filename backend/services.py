import os
import json
import re
from dotenv import load_dotenv

load_dotenv()

# Initialize AI Clients if keys are available
OPENAI_KEY = os.getenv("OPENAI_API_KEY")
GEMINI_KEY = os.getenv("GEMINI_API_KEY")

if OPENAI_KEY:
    import openai
    openai_client = openai.OpenAI(api_key=OPENAI_KEY)
else:
    openai_client = None

if GEMINI_KEY:
    import google.generativeai as genai
    genai.configure(api_key=GEMINI_KEY)
    gemini_model = genai.GenerativeModel('gemini-1.5-flash')
else:
    gemini_model = None

def calculate_tax_burden(total_tax_paid: float, total_turnover: float) -> float:
    if total_turnover <= 0:
        return 0.0
    return round((total_tax_paid / total_turnover) * 100, 2)

def calculate_export_efficiency(export_volume: float, total_turnover: float) -> float:
    if total_turnover <= 0:
        return 0.0
    return round((export_volume / total_turnover) * 100, 2)

def generate_analysis(company) -> dict:
    tax_burden = calculate_tax_burden(float(company.total_tax_paid), float(company.total_turnover))
    export_efficiency = calculate_export_efficiency(float(company.export_volume), float(company.total_turnover))
    
    potential_benefit = "Imtiyoz mavjud emas."
    if export_efficiency > 15:
        potential_benefit = "Eksport ulushi 15% dan oshgani uchun Foyda solig'ini 50% ga kamaytirish imtiyozi qo'llanilishi mumkin."

    # Default Data Structure
    result_data = {
        "inn": company.inn,
        "tax_burden_percent": tax_burden,
        "export_efficiency_percent": export_efficiency,
        "potential_benefit": potential_benefit,
        "recommendations": [],
        "swot": {
            "strengths": [],
            "weaknesses": [],
            "opportunities": [],
            "threats": []
        },
        "ai_powered": False
    }
    
    ai_generated = False
    if OPENAI_KEY or GEMINI_KEY:
        prompt = f"""
Siz professional moliyaviy va yuridik tahlilchisiz. O'zbekiston Respublikasi soliq qonunchiligiga asoslanib qisqa va aniq tahlil bering.
Korxona holati:
- Soliq yuki: {tax_burden}%
- Eksport samaradorligi: {export_efficiency}%
- Soliq qarzdorligi: {company.tax_debt} so'm.
- Imtiyoz holati: {potential_benefit}

Qat'iy ravishda QUYIDAGI JSON FORMATIDA javob bering (boshqa hech qanday so'z qo'shmang, Markdown belgilari kerak emas):
{{
  "recommendations": [
    "Soliq yuki yuqori ekanligi bo'yicha tavsiya",
    "Eksportni oshirish bo'yicha tavsiya",
    "Boshqa strategik tavsiya"
  ],
  "swot": {{
    "strengths": ["Kuchli tomon 1", "Kuchli tomon 2"],
    "weaknesses": ["Kuchsiz tomon 1"],
    "opportunities": ["Imkoniyat 1"],
    "threats": ["Xavf 1"]
  }}
}}
"""
        try:
            ai_text = ""
            if OPENAI_KEY:
                response = openai_client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[{"role": "user", "content": prompt}],
                    response_format={"type": "json_object"}
                )
                ai_text = response.choices[0].message.content.strip()
            else:
                response = gemini_model.generate_content(prompt)
                ai_text = response.text.strip()
                
                # Cleanup potential markdown ticks if Gemini adds them
                ai_text = re.sub(r'^```json', '', ai_text)
                ai_text = re.sub(r'^```', '', ai_text)
                ai_text = re.sub(r'```$', '', ai_text).strip()

            parsed_json = json.loads(ai_text)
            
            # Map Parsed JSON
            if "recommendations" in parsed_json:
                result_data["recommendations"] = parsed_json["recommendations"]
            if "swot" in parsed_json:
                result_data["swot"]["strengths"] = parsed_json["swot"].get("strengths", [])
                result_data["swot"]["weaknesses"] = parsed_json["swot"].get("weaknesses", [])
                result_data["swot"]["opportunities"] = parsed_json["swot"].get("opportunities", [])
                result_data["swot"]["threats"] = parsed_json["swot"].get("threats", [])
                
            result_data["ai_powered"] = True
            ai_generated = True
        except Exception as e:
            print(f"AI Generation/Parsing Error: {e}")
            pass
    
    # Fallback to mock logic if AI failed or not configured
    if not ai_generated:
        if export_efficiency > 15:
            result_data["swot"]["strengths"].append(f"Eksport samaradorligi yuqori ({export_efficiency}%)")
            result_data["recommendations"].append("Soliq organiga imtiyozni qo'llash bo'yicha ariza yuborish tavsiya etiladi.")
        else:
            result_data["swot"]["weaknesses"].append(f"Eksport hajmi yetarli emas ({export_efficiency}%)")
            result_data["recommendations"].append("Eksport hajmini umumiy ishlab chiqarishning 15% idan oshirish ustida ishlash kerak.")
            
        if tax_burden > 20:
            result_data["swot"]["weaknesses"].append(f"Soliq yuki yuqori ({tax_burden}%)")
            result_data["recommendations"].append("Qonuniy soliq imtiyozlarini o'rganish zarur.")
        else:
            result_data["swot"]["strengths"].append("Soliq yuki me'yorida")
            
        if float(company.tax_debt) > 0:
            result_data["swot"]["threats"].append("Soliq qarzdorligi mavjud")
            result_data["recommendations"].append(f"Diqqat! {company.tax_debt} so'm miqdorida soliq qarzdorligi aniqlandi. Zudlik bilan so'ndirish choralarini ko'ring.")
        
        if len(result_data["recommendations"]) == 0:
             result_data["recommendations"].append("Korxona faoliyati barqaror ko'rinmoqda.")
             result_data["swot"]["opportunities"].append("Yangi bozorlarni o'zlashtirish")

    return result_data
