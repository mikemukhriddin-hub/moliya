import { useState } from 'react'
import { Lock, User, ArrowRight, UserPlus, ShieldCheck, Activity, BarChart3, Globe } from 'lucide-react'

export default function Login({ onLogin }) {
  const [isLoginView, setIsLoginView] = useState(true)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    
    if (!username || !password) {
      setError("Iltimos, barcha maydonlarni to'ldiring.")
      return
    }

    if (!isLoginView && password !== confirmPassword) {
      setError("Parollar mos tushmadi!")
      return
    }

    setLoading(true)
    
    try {
      if (isLoginView) {
        // Login Request
        const formData = new URLSearchParams()
        formData.append('username', username)
        formData.append('password', password)

        const response = await fetch('http://localhost:8000/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData
        })

        if (!response.ok) {
          throw new Error("Login yoki parol noto'g'ri")
        }

        const data = await response.json()
        localStorage.setItem('token', data.access_token)
        onLogin(username)
      } else {
        // Register Request
        const response = await fetch('http://localhost:8000/users/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: username,
            password: password,
            role: 'analyst'
          })
        })

        if (!response.ok) {
          const errData = await response.json()
          throw new Error(errData.detail || "Ro'yxatdan o'tishda xatolik")
        }

        // Avtomatik tizimga kirish
        const loginFormData = new URLSearchParams()
        loginFormData.append('username', username)
        loginFormData.append('password', password)

        const loginResponse = await fetch('http://localhost:8000/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: loginFormData
        })
        
        if (loginResponse.ok) {
          const data = await loginResponse.json()
          localStorage.setItem('token', data.access_token)
          onLogin(username)
        } else {
          setSuccess("Muvaffaqiyatli ro'yxatdan o'tdingiz! Endi tizimga kiring.")
          setIsLoginView(true)
          setConfirmPassword('')
          setPassword('')
        }
      }
    } catch (err) {
      if (err.message.includes("Failed to fetch") || err.message.includes("NetworkError")) {
        setError("Server bilan aloqa yo'q (Backend yoniq emas).")
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container fade-in" style={{ display: 'flex', minHeight: '100vh', padding: 0 }}>
      {/* Left Branding Side */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px', background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.95))', borderRight: '1px solid rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden' }}>
        
        {/* Background shapes */}
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '300px', height: '300px', background: 'rgba(59, 130, 246, 0.2)', borderRadius: '50%', filter: 'blur(80px)' }}></div>
        <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '400px', height: '400px', background: 'rgba(139, 92, 246, 0.15)', borderRadius: '50%', filter: 'blur(100px)' }}></div>

        <div style={{ zIndex: 1, maxWidth: '500px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
            <div style={{ width: '56px', height: '56px', background: 'linear-gradient(135deg, var(--primary-color), var(--accent-color))', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px rgba(59, 130, 246, 0.4)' }}>
              <BarChart3 size={28} color="white" />
            </div>
            <h1 style={{ fontSize: '32px', fontWeight: '800', letterSpacing: '-1px' }}>Smart Analysis <span style={{ color: 'var(--primary-color)' }}>AI</span></h1>
          </div>
          
          <h2 style={{ fontSize: '48px', fontWeight: '800', lineHeight: 1.1, marginBottom: '24px', background: 'linear-gradient(to right, #fff, #9ca3af)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Biznesingizni sun'iy intellekt orqali himoya qiling.
          </h2>
          
          <p style={{ color: 'var(--text-secondary)', fontSize: '18px', lineHeight: 1.6, marginBottom: '40px' }}>
            Korxonalarning ochiq ma'lumotlarini (Open Data) yig'ib, SWOT tahlilini yarating va soliq xavflarini oldindan aniqlang. Barchasi avtomatlashtirilgan AI vositasida.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-primary)', background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <ShieldCheck size={24} color="var(--success)" /> <span>Soliq risklarini 99% aniqlikda tahlil qilish</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-primary)', background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <Activity size={24} color="var(--primary-color)" /> <span>Real vaqt rejimida moliyaviy barqarorlik tekshiruvi</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-primary)', background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <Globe size={24} color="var(--accent-color)" /> <span>O'zbekistondagi ochiq ma'lumotlar integratsiyasi</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Side */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', background: 'var(--bg-dark)' }}>
        <div className="login-box glass-panel" style={{ width: '100%', maxWidth: '480px', padding: '48px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
          <div className="header" style={{ marginBottom: '32px', textAlign: 'left' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>Xush kelibsiz</h2>
            <p style={{ color: 'var(--text-secondary)' }}>{isLoginView ? "Platformaga kirish uchun ma'lumotlaringizni kiriting" : "Yangi analitik profilini yarating"}</p>
          </div>

          <form onSubmit={handleSubmit}>
            {error && (
              <div className="fade-in" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '12px 16px', borderRadius: '8px', fontSize: '14px', marginBottom: '20px', borderLeft: '4px solid var(--danger)' }}>
                {error}
              </div>
            )}
            {success && (
              <div className="fade-in" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '12px 16px', borderRadius: '8px', fontSize: '14px', marginBottom: '20px', borderLeft: '4px solid var(--success)' }}>
                {success}
              </div>
            )}
            
            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' }}>Login</label>
              <div style={{ position: 'relative', marginTop: '8px' }}>
                <User size={20} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--text-secondary)' }} />
                <input 
                  type="text" 
                  className="input-field" 
                  style={{ paddingLeft: '48px', height: '52px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}
                  placeholder="admin" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' }}>Parol</label>
              <div style={{ position: 'relative', marginTop: '8px' }}>
                <Lock size={20} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--text-secondary)' }} />
                <input 
                  type="password" 
                  className="input-field" 
                  style={{ paddingLeft: '48px', height: '52px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {!isLoginView && (
              <div className="form-group fade-in" style={{ marginBottom: '32px' }}>
                <label style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' }}>Parolni tasdiqlash</label>
                <div style={{ position: 'relative', marginTop: '8px' }}>
                  <Lock size={20} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--text-secondary)' }} />
                  <input 
                    type="password" 
                    className="input-field" 
                    style={{ paddingLeft: '48px', height: '52px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}
                    placeholder="••••••••" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
            )}

            <button type="submit" className="btn-primary" style={{ width: '100%', height: '52px', fontSize: '16px', borderRadius: '12px', marginTop: isLoginView ? '16px' : '0' }} disabled={loading}>
              {loading ? <div className="loader" style={{ width: '20px', height: '20px' }} /> : (
                <>
                  {isLoginView ? "Platformaga kirish" : "Ro'yxatdan o'tish"} <ArrowRight size={20} />
                </>
              )}
            </button>

            <div style={{ marginTop: '32px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '24px' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
                {isLoginView ? "Akkauntingiz yo'qmi?" : "Akkauntingiz bormi?"}
              </span>
              <button 
                type="button"
                onClick={() => {
                  setIsLoginView(!isLoginView)
                  setError('')
                  setSuccess('')
                }} 
                style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', marginLeft: '8px', fontSize: '15px', fontWeight: '600' }}
              >
                {isLoginView ? "Ro'yxatdan o'tish" : "Tizimga kirish"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
