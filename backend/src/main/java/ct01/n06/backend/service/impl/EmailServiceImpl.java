package ct01.n06.backend.service.impl;

import java.nio.file.Path;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.util.HtmlUtils;

import ct01.n06.backend.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

  private final JavaMailSender javaMailSender;

  @Value("${spring.mail.username:}")
  private String smtpUsername;

  @Value("${spring.mail.password:}")
  private String smtpPassword;

  @Value("${MAIL_FROM:}")
  private String fromAddress;

  @Override
  public EmailSendSummary sendNotificationEmail(
      String subject,
      String content,
      String senderName,
      List<EmailRecipient> recipients,
      String attachmentName,
      Path attachmentPath
  ) {
    if (recipients == null || recipients.isEmpty()) {
      return new EmailSendSummary(0, 0);
    }

    if (!StringUtils.hasText(smtpUsername) || !StringUtils.hasText(smtpPassword)) {
      log.warn("Bỏ qua gửi email vì chưa cấu hình SMTP: username/password rỗng.");
      return new EmailSendSummary(0, recipients.size());
    }

    int sentCount = 0;
    int failedCount = 0;
    String from = StringUtils.hasText(fromAddress) ? fromAddress : smtpUsername;

    for (EmailRecipient recipient : recipients) {
      try {
        var mimeMessage = javaMailSender.createMimeMessage();
        var helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

        helper.setFrom(from);
        helper.setTo(recipient.email());
        helper.setSubject(subject);
        helper.setText(
          buildHtmlBody(subject, content, senderName, recipient.fullName(), attachmentName),
          true
        );

        if (attachmentPath != null && StringUtils.hasText(attachmentName)) {
          helper.addAttachment(attachmentName, new FileSystemResource(attachmentPath));
        }

        javaMailSender.send(mimeMessage);
        sentCount++;
      } catch (Exception ex) {
        failedCount++;
        log.warn("Gửi email thông báo thất bại tới {}: {}", recipient.email(), ex.getMessage());
      }
    }

    return new EmailSendSummary(sentCount, failedCount);
  }

  private String buildHtmlBody(
      String subject,
      String content,
      String senderName,
      String recipientName,
      String attachmentName
  ) {
    String safeRecipientName = StringUtils.hasText(recipientName)
        ? HtmlUtils.htmlEscape(recipientName)
        : "Anh/Chị";
    String safeSubject = HtmlUtils.htmlEscape(subject);
    String safeContent = HtmlUtils.htmlEscape(content).replace("\n", "<br/>");
    String safeSender = StringUtils.hasText(senderName) ? HtmlUtils.htmlEscape(senderName) : "Giảng viên";
    String safeAttachment = StringUtils.hasText(attachmentName) ? HtmlUtils.htmlEscape(attachmentName) : null;

    String attachmentSection = safeAttachment == null
        ? ""
        : """
            <tr>
              <td style=\"padding:0 24px 16px 24px;color:#0f172a;font-size:14px;\">
                <strong>File đính kèm:</strong> %s
              </td>
            </tr>
            """.formatted(safeAttachment);

    return """
        <table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%%\"
               style=\"background:#f8fafc;padding:24px 0;font-family:Arial,Helvetica,sans-serif;\">
          <tr>
            <td align=\"center\">
              <table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" width=\"620\"
                     style=\"max-width:620px;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;\">
                <tr>
                  <td style=\"background:linear-gradient(135deg,#b91c1c,#dc2626);padding:18px 24px;color:#ffffff;\">
                    <div style=\"font-size:18px;font-weight:700;letter-spacing:0.2px;\">UniPoint</div>
                    <div style=\"font-size:12px;color:#fee2e2;margin-top:4px;\">Thông báo từ hệ thống</div>
                  </td>
                </tr>
                <tr>
                  <td style=\"padding:24px;color:#0f172a;font-size:14px;line-height:1.6;\">
                    <p style=\"margin:0 0 12px 0;\">Kính gửi %s,</p>
                    <p style=\"margin:0 0 16px 0;\">Bạn vừa nhận được một thông báo mới từ hệ thống UniPoint.</p>
                  </td>
                </tr>
                <tr>
                  <td style=\"padding:0 24px 8px 24px;color:#0f172a;font-size:14px;\">
                    <strong>Tiêu đề:</strong> %s
                  </td>
                </tr>
                <tr>
                  <td style=\"padding:0 24px 8px 24px;color:#0f172a;font-size:14px;\">
                    <strong>Người gửi:</strong> %s
                  </td>
                </tr>
                %s
                <tr>
                  <td style=\"padding:8px 24px 24px 24px;color:#0f172a;font-size:14px;\">
                    <strong>Nội dung:</strong>
                    <div style=\"margin-top:8px;padding:12px 14px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;\">%s</div>
                  </td>
                </tr>
                <tr>
                  <td style=\"padding:0 24px 24px 24px;color:#334155;font-size:13px;line-height:1.6;\">
                    Vui lòng đăng nhập UniPoint để xem đầy đủ chi tiết và lịch sử thông báo.
                  </td>
                </tr>
                <tr>
                  <td style=\"border-top:1px solid #e2e8f0;padding:16px 24px;color:#64748b;font-size:12px;\">
                    Email này được gửi tự động từ hệ thống UniPoint. Vui lòng không trả lời email này.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        """.formatted(safeRecipientName, safeSubject, safeSender, attachmentSection, safeContent);
  }
}
