

const brevo = require('@getbrevo/brevo');
const { env } = require('~/config/environment');


let apiInstance = new brevo.TransactionalEmailsApi()
let apiKey = apiInstance.authentications['apiKey']
apiKey.apiKey = env.BREVO_API_KEY

const sendEmail = async (recipientEmail, customeSubject, htmlContent) => {
    //Khởi tạo một cái sendEmail với những thông tin cần thiết
    let sendSmtpEmail = new brevo.SendSmtpEmail()
    //Tài khoản gửi mail: lưu ý địa chỉ admin email phải là cái email mà các bạn tạo tài khoản trên Brevo

    sendSmtpEmail.sender = { email: env.ADMIN_ADDRESS_EMAIL, name: env.ADMIN_EMAIL_NAME }

    //Những tài khoản nhận mail
    // 'to' phải là một Array để sau chúng ta có thể tùy biến gửi 1 email tới nhiều user tùy tính năng dự án
    sendSmtpEmail.to = [{ email: recipientEmail }]

    //Tiều đề của email
    sendSmtpEmail.subject = customeSubject

    //Nội dung email dạng HTML
    sendSmtpEmail.htmlContent = htmlContent

    //Gọi hành động gửi mail
    return apiInstance.sendTransacEmail(sendSmtpEmail)
}

export const BrevoProvider = {
    sendEmail
}