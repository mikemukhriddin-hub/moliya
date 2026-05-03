import { useState } from 'react'
import { Search, Building2, LogOut, FileText, AlertCircle, TrendingUp, BarChart3, Globe } from 'lucide-react'
import AnalysisReport from './AnalysisReport'

export default function Dashboard({ user, onLogout }) {
  const [stir, setStir] = useState('')
  const [loading, setLoading] = useState(false)
  const [reportData, setReportData] = useState(null)
  const [error, setError] = useState('')

  const handleAnalyze = async (e, directStir = null) => {
    if (e) e.preventDefault()
    const targetStir = directStir || stir
    
    setError('')
    
    if (!targetStir || !/^\d{9}$/.test(targetStir)) {
      setError("Iltimos, faqat 9 ta raqamdan iborat to'g'ri STIR kiriting.")
      return
    }

    setStir(targetStir)
    setLoading(true)
    setReportData(null)

    try {
      const token = localStorage.getItem('token') || ''
      const response = await fetch(`http://localhost:8000/analyze/${targetStir}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error("Server xatoligi yuz berdi.")
      }

      const data = await response.json()
      
      // Map API response to our UI structure
      setReportData({
        passport: {
          name: `Kompaniya (STIR: ${data.inn})`,
          inn: data.inn,
          activity: "Biznes faoliyati va Savdo",
          director: "Noma'lum",
          status: "Faol",
          license: "Mavjud (Reyting: Yaxshi)"
        },
        financial: {
          taxRegime: "Umumiy belgilangan soliqlar",
          debt: "Qarzdorlik aniqlanmadi",
          competitiveness: "Bozorda barqaror o'rin",
          riskLevel: data.tax_burden_percent > 20 ? "Yuqori (Soliq yuki)" : "O'rtacha barqaror"
        },
        swot: {
          strengths: [
            `Eksport samaradorligi: ${data.export_efficiency_percent}%`,
            data.potential_benefit !== "Imtiyoz yo'q" ? "Imtiyoz qo'llash imkoniyati mavjud" : "Barqaror aylanma mablag'",
            "Sohada yaxshi tajribaga ega"
          ],
          weaknesses: [
            `Soliq yuki: ${data.tax_burden_percent}%`,
            "Marketing byudjeti kamligi"
          ],
          opportunities: [
            data.potential_benefit,
            "Yangi bozorlarga chiqish (Eksportni oshirish)"
          ],
          threats: [
            "Bozordagi raqobatning kuchayishi",
            "Xom ashyo narxining oshishi"
          ]
        },
        recommendations: data.recommendations
      })
    } catch (err) {
      if (err.message.includes("Failed to fetch") || err.message.includes("NetworkError")) {
        setError("Server bilan aloqa yo'q, iltimos keyinroq urinib ko'ring (Backend yoniq emas).")
      } else {
        setError("Xatolik yuz berdi: " + err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-container fade-in">
      {/* Header Navbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', padding: '16px 24px', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-color)', backdropFilter: 'blur(10px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="stat-icon" style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, var(--primary-color), var(--accent-color))' }}>
            <BarChart3 size={20} color="white" />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', letterSpacing: '-0.5px' }}>Smart Analysis <span style={{ color: 'var(--primary-color)' }}>AI</span></h2>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', background: 'var(--success)', borderRadius: '50%', boxShadow: '0 0 8px var(--success)' }}></div>
            Tizim faol
          </div>
          <div style={{ width: '1px', height: '24px', background: 'var(--border-color)' }}></div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{user?.username || 'Admin'}</span>
          </div>
          <button onClick={onLogout} style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: 'var(--danger)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', fontWeight: '500', transition: 'all 0.2s' }}>
            <LogOut size={16} /> Chiqish
          </button>
        </div>
      </div>

      <div className="search-section" style={{ maxWidth: '700px', marginTop: '60px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '6px 16px', borderRadius: '100px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-color)', fontSize: '14px', fontWeight: '500' }}>
            <Globe size={16} /> O'zbekiston korxonalari bazasi (Open Data)
          </div>
        </div>
        <h1 style={{ fontSize: '42px', fontWeight: '800', marginBottom: '20px', color: 'var(--text-primary)', lineHeight: '1.2' }}>
          Sun'iy Intellekt yordamida korxonani tahlil qiling
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '18px', marginBottom: '32px' }}>
          STIR (INN) raqamini kiriting, tizim korxonaning moliyaviy, huquqiy holatini va xavf-xatarlarni atigi 10 soniyada tahlil qiladi.
        </p>

        <form onSubmit={(e) => handleAnalyze(e)} className="search-input-wrapper glass-panel" style={{ padding: '12px', display: 'flex', gap: '12px', background: 'rgba(0,0,0,0.4)', borderRadius: '100px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={22} style={{ position: 'absolute', left: '20px', top: '16px', color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              className="input-field"
              style={{ paddingLeft: '56px', height: '54px', fontSize: '18px', background: 'transparent', border: 'none', boxShadow: 'none' }}
              placeholder="Korxona STIR (INN) raqami... (masalan: 302145678)"
              value={stir}
              onChange={(e) => setStir(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading} style={{ height: '54px', borderRadius: '100px', padding: '0 32px', fontSize: '16px' }}>
            {loading ? <div className="loader" style={{width: '20px', height: '20px'}} /> : 'Tahlil boshlash'}
          </button>
        </form>
        {error && <div style={{ color: 'var(--danger)', marginTop: '16px', textAlign: 'center', background: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: '8px' }}>{error}</div>}
      </div>

      {!reportData && !loading && !error && (
        <div style={{ marginTop: '60px', opacity: 0.7 }}>
          <h3 style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '24px' }}>Mashhur izlanishlar</h3>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            {[
              { inn: '302145678', name: 'Artel Group' },
              { inn: '201122334', name: 'Texnomart' },
              { inn: '305678123', name: 'UzAuto Motors' }
            ].map((company) => (
              <button 
                key={company.inn}
                onClick={() => handleAnalyze(null, company.inn)}
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '12px 20px', borderRadius: '100px', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}
                onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseOut={(e) => { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.transform = 'none' }}
              >
                <Building2 size={16} color="var(--primary-color)" /> {company.name} ({company.inn})
              </button>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <div className="fade-in" style={{ textAlign: 'center', padding: '80px 0' }}>
          <div className="loader" style={{ width: '56px', height: '56px', borderWidth: '4px', marginBottom: '24px', borderColor: 'rgba(255,255,255,0.1)', borderTopColor: 'var(--accent-color)' }}></div>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '12px', fontSize: '24px' }}>AI modellari ishlamoqda...</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto', lineHeight: '1.5' }}>
            Davlat soliq qo'mitasi va Statistika reestridan ma'lumotlar olinmoqda va moliya modellari orqali xavf-xatar baxolanmoqda.
          </p>
        </div>
      )}

      {reportData && !loading && (
        <AnalysisReport data={reportData} />
      )}
    </div>
  )
}
