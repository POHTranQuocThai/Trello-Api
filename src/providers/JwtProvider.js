import JWT from 'jsonwebtoken'

const generateToken = async (userInfo, secretSignature, tokenLife) => {
  if (!secretSignature) {
    throw new Error('secretSignature must have a value asdasd')
  }
  try {
    return JWT.sign(userInfo, secretSignature, { algorithm: 'HS256', expiresIn: tokenLife })
  } catch (error) {
    throw new Error(`Error generating token: ${error.message} asdadd`)
  }

}

const verifyToken = async (token, secretSignature) => {
  try {
    return JWT.verify(token, secretSignature)
  } catch (error) {
    throw new Error(`Error verifying token: ${error.message}`)
  }
}
export const JwtProvider = {
  generateToken,
  verifyToken
}