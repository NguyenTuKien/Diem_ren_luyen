package ct01.n06.backend.service;

import java.nio.file.Path;
import java.util.List;

public interface EmailService {

  EmailSendSummary sendNotificationEmail(
      String subject,
      String content,
      String senderName,
      List<EmailRecipient> recipients,
      String attachmentName,
      Path attachmentPath
  );

  record EmailRecipient(String email, String fullName) {
  }

  record EmailSendSummary(int sentCount, int failedCount) {
  }
}
