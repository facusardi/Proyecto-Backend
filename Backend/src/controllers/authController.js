const { getSupabase } = require('../supabaseClient')
const crypto = require('crypto')
const { promisify } = require('util')

const scrypt = promisify(crypto.scrypt)
const TABLE = 'Usuario'

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex')
  const derivedKey = await scrypt(password, salt, 64)
  return `${salt}:${derivedKey.toString('hex')}`
}

async function verifyPassword(password, stored) {
  const [salt, key] = stored.split(':')
  if (!salt || !key) return false
  const derivedKey = await scrypt(password, salt, 64)
  return crypto.timingSafeEqual(Buffer.from(key, 'hex'), derivedKey)
}

/* JWT minimal con HMAC SHA256 (no dependencias) */
function base64url(input) {
  return Buffer.from(input).toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

function signToken(payload, expiresInSeconds = 8 * 3600) {
  const header = { alg: 'HS256', typ: 'JWT' }
  const now = Math.floor(Date.now() / 1000)
  const body = Object.assign({}, payload, { iat: now, exp: now + expiresInSeconds })
  const encodedHeader = base64url(JSON.stringify(header))
  const encodedBody = base64url(JSON.stringify(body))
  const secret = process.env.JWT_SECRET || 'secret'
  const signature = crypto.createHmac('sha256', secret)
    .update(`${encodedHeader}.${encodedBody}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
  return `${encodedHeader}.${encodedBody}.${signature}`
}

function verifyToken(token) {
  try {
    const secret = process.env.JWT_SECRET || 'secret'
    const [encHeader, encBody, sig] = token.split('.')
    if (!encHeader || !encBody || !sig) return null
    const expected = crypto.createHmac('sha256', secret)
      .update(`${encHeader}.${encBody}`)
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
    if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig))) return null
    const body = JSON.parse(Buffer.from(encBody, 'base64').toString())
    if (body.exp && Math.floor(Date.now() / 1000) > body.exp) return null
    return body
  } catch (e) {
    return null
  }
}

/* register y login */
exports.register = async (req, res) => {
  try {
    console.log('Register body raw:', req.body)
    const Nombre = req.body.Nombre || req.body.nombre || null
    const Apellido = req.body.Apellido || req.body.apellido || null
    const Apodo = req.body.Apodo || req.body.apodo || req.body.username || null
    const Email = req.body.Email || req.body.email || null
    const Password = req.body.Password || req.body.password || null

    if (!Email || !Password || !Apodo) {
      console.warn('Register missing fields:', { Nombre, Apellido, Apodo, Email })
      return res.status(400).json({ message: 'Faltan datos' })
    }

    const supabase = await getSupabase()
    const { data: existing, error: errFind } = await supabase
      .from(TABLE)
      .select('id_User')
      .or(`Apodo.eq.${Apodo},Email.eq.${Email}`)
      .limit(1)

    if (errFind) {
      console.error('Error checking existing user:', errFind)
      return res.status(500).json({ message: 'Error servidor' })
    }

    if (existing && existing.length) return res.status(400).json({ message: 'Apodo o email ya en uso' })

    const hashed = await hashPassword(Password)
    const { data, error } = await supabase
      .from(TABLE)
      .insert([{ Nombre, Apellido, Apodo, Email, Password: hashed, Rol_User: 'user' }])
      .select()

    console.log('Insert result:', { data, error })
    if (error) {
      return res.status(500).json({ message: error.message || 'Error insert' })
    }

    return res.status(201).json({ message: 'Usuario registrado', user: data?.[0] || null })
  } catch (err) {
    console.error('Register error:', err)
    res.status(500).json({ message: err.message })
  }
}

exports.login = async (req, res) => {
  try {
    console.log('Login body raw:', req.body)
    const Email = req.body.Email || req.body.email || null
    const Apodo = req.body.Apodo || req.body.apodo || null
    const Password = req.body.Password || req.body.password || null
    if (!Password || (!Email && !Apodo)) return res.status(400).json({ message: 'Faltan datos' })

    const supabase = await getSupabase()
    // Buscar por Email o por Apodo
    const filter = Email ? `Email.eq.${Email}` : `Apodo.eq.${Apodo}`
    const resp = await supabase.from(TABLE).select('*').or(filter).limit(1)
    console.log('Login user fetch:', resp)
    const user = resp.data && resp.data[0]
    if (!user) return res.status(401).json({ message: 'Credenciales inválidas' })

    const ok = await verifyPassword(Password, user.Password)
    if (!ok) return res.status(401).json({ message: 'Credenciales inválidas' })

    const token = signToken({ id_User: user.id_User, Apodo: user.Apodo })
    delete user.Password
    return res.json({ token, user })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ message: err.message })
  }
}