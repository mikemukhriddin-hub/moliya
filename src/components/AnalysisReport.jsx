import { Building, AlertTriangle, CheckCircle, TrendingUp, Shield, Lightbulb, Activity, Download, FileText } from 'lucide-react'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { useState } from 'react'

export default function AnalysisReport({ data }) {
  const [downloading, setDownloading] = useState(false)

  const handleDownloadPDF = async () => {
    setDownloading(true)
    const element = document.getElementById('report-content')
    try {
      const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#0f1115' })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
      pdf.save(`Hisobot-${data.passport.inn}.pdf`)
    } catch (err) {
      console.error("PDF yuklab olishda xatolik:", err)
    } finally {
      setDownloading(false)
    }
  }

  // Generate metrics for charts based on risk level and status
  const isHighRisk = data.financial.riskLevel.includes('Yuqori')
  
  const radarData = [
    { subject: 'Soliq Barqarorligi', A: isHighRisk ? 40 : 85, fullMark: 100 },
    { subject: 'Raqobatdoshlik', A: 75, fullMark: 100 },
    { subject: 'Eksport Salohiyati', A: data.swot.strengths[0].includes('Eksport') ? 80 : 40, fullMark: 100 },
    { subject: 'Moliyaviy Imkoniyat', A: isHighRisk ? 50 : 90, fullMark: 100 },
    { subject: 'Yuridik Toza', A: 95, fullMark: 100 },
  ];

  const barData = [
    { name: 'Soliq Yuki', foiz: isHighRisk ? 25 : 15 },
    { name: 'O\'rtacha (Soha)', foiz: 18 },
    { name: 'Eksport', foiz: 30 }
  ];

  return (
    <div className="fade-in" style={{ marginTop: '30px' }}>
      
      {/* Harakatlar paneli */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.2)' }}>
            <Activity size={24} color="var(--primary-color)" />
          </div>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' }}>Kompleks Tahlil Hisoboti</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Sun'iy intellekt tomonidan shakllantirildi</p>
          </div>
        </div>

        <button 
          onClick={handleDownloadPDF} 
          disabled={downloading}
          className="btn-primary" 
          style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
        >
          {downloading ? (
            <><div className="loader" style={{ width: '16px', height: '16px', borderWidth: '2px' }} /> Yuklanmoqda...</>
          ) : (
            <><Download size={18} /> PDF formatida saqlash</>
          )}
        </button>
      </div>

      {/* Hisobot kontenti (PDF uchun) */}
      <div id="report-content" style={{ padding: '10px' }}>
        
        {/* Yuqori qism: Pasport va Holat */}
        <div className="grid-2" style={{ marginBottom: '24px' }}>
          {/* Korxona Pasporti */}
          <div className="glass-panel" style={{ borderLeft: '4px solid var(--primary-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <Building size={24} color="var(--primary-color)" />
              <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Korxona Pasporti</h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Nomi:</span>
                <strong style={{ textAlign: 'right' }}>{data.passport.name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>STIR (INN):</span>
                <strong style={{ color: 'var(--accent-color)' }}>{data.passport.inn}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Faoliyat:</span>
                <strong style={{ textAlign: 'right' }}>{data.passport.activity}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Holati:</span>
                <span className="badge badge-success">{data.passport.status}</span>
              </div>
            </div>
          </div>

          {/* Yuridik va Iqtisodiy Holat */}
          <div className="glass-panel" style={{ borderLeft: `4px solid ${isHighRisk ? 'var(--danger)' : 'var(--success)'}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <Shield size={24} color={isHighRisk ? "var(--danger)" : "var(--success)"} />
              <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Xavfsizlik va Moliya</h3>
            </div>

            <div className="grid-2" style={{ gap: '16px' }}>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '8px' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '12px', display: 'block', marginBottom: '4px' }}>Soliq tizimi</span>
                <strong style={{ fontSize: '14px' }}>{data.financial.taxRegime}</strong>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '8px' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '12px', display: 'block', marginBottom: '4px' }}>Qarzdorlik</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle size={16} color="var(--success)" />
                  <strong style={{ fontSize: '14px', color: 'var(--success)' }}>{data.financial.debt}</strong>
                </div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '8px', gridColumn: '1 / -1' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '12px', display: 'block', marginBottom: '4px' }}>AI Xatar Darajasi (Risk Level)</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {isHighRisk ? <AlertTriangle size={18} color="var(--danger)" /> : <CheckCircle size={18} color="var(--success)" />}
                  <strong style={{ fontSize: '16px', color: isHighRisk ? 'var(--danger)' : 'var(--success)' }}>{data.financial.riskLevel}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Grafikalar Qismi */}
        <div className="grid-2" style={{ marginBottom: '24px' }}>
          <div className="glass-panel" style={{ height: '350px', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: 'var(--text-secondary)' }}>Kompaniya Potensiali (Radar)</h3>
            <div style={{ flex: 1, minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="Kompaniya" dataKey="A" stroke="var(--primary-color)" fill="var(--primary-color)" fillOpacity={0.5} />
                  <Tooltip contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-panel" style={{ height: '350px', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: 'var(--text-secondary)' }}>Soliq va Eksport Taqqoslamasi</h3>
            <div style={{ flex: 1, minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--text-secondary)" tick={{fontSize: 12}} />
                  <YAxis stroke="var(--text-secondary)" tick={{fontSize: 12}} />
                  <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                  <Bar dataKey="foiz" fill="var(--accent-color)" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* SWOT Tahlil */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <TrendingUp size={24} color="var(--success)" />
            <h3 style={{ fontSize: '20px', fontWeight: '600' }}>Strategik SWOT-Tahlil</h3>
          </div>
          
          <div className="swot-grid">
            <div className="swot-card swot-s">
              <h3>S (Strengths) - Kuchli tomonlar</h3>
              <ul className="swot-list">
                {data.swot.strengths.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </div>
            <div className="swot-card swot-w">
              <h3>W (Weaknesses) - Kuchsiz tomonlar</h3>
              <ul className="swot-list">
                {data.swot.weaknesses.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </div>
            <div className="swot-card swot-o">
              <h3>O (Opportunities) - Imkoniyatlar</h3>
              <ul className="swot-list">
                {data.swot.opportunities.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </div>
            <div className="swot-card swot-t">
              <h3>T (Threats) - Xavflar</h3>
              <ul className="swot-list">
                {data.swot.threats.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </div>
          </div>
        </div>

        {/* Tavsiyalar */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <Lightbulb size={24} color="var(--warning)" />
            <h3 style={{ fontSize: '20px', fontWeight: '600' }}>AI Tavsiyalari va Xulosa</h3>
          </div>
          
          <div className="glass-panel" style={{ background: 'rgba(245, 158, 11, 0.05)', borderColor: 'rgba(245, 158, 11, 0.2)' }}>
            {data.recommendations.map((rec, idx) => (
              <div key={idx} className="rec-item" style={{ background: 'rgba(0,0,0,0.2)' }}>
                <FileText size={20} className="rec-item-icon" color="var(--warning)" />
                <div className="rec-item-content">
                  <h4 style={{ color: 'var(--warning)' }}>Tavsiya {idx + 1}</h4>
                  <p style={{ color: '#e5e7eb' }}>{rec}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
      </div>
    </div>
  )
}
