package com.example.Inventra.service;

import com.example.Inventra.dto.StockAlertResponseDTO;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.alert.manager-email}")
    private String managerEmail;

    @Async
    public void sendLowStockAlert(StockAlertResponseDTO alert) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setFrom(managerEmail);
            helper.setTo(managerEmail);
            helper.setSubject("LOW STOCK ALERT — " + alert.getProductName());
            helper.setText(buildEmailBody(alert), true);

            mailSender.send(message);
            log.info("LOW_STOCK_EMAIL_SENT: SKU=[{}] to=[{}]",
                    alert.getProductSku(), managerEmail);

        } catch (MessagingException e) {
            log.error("EMAIL_SEND_FAILED: SKU=[{}] reason=[{}]",
                    alert.getProductSku(), e.getMessage());
        }
    }

    private String buildEmailBody(StockAlertResponseDTO alert) {
        return """
                <html>
                <body style="font-family: Arial, sans-serif;">
                    <h2 style="color: #e74c3c;">Low Stock Alert</h2>
                    <table border="1" cellpadding="8" cellspacing="0">
                        <tr><td><b>Product</b></td><td>%s</td></tr>
                        <tr><td><b>SKU</b></td><td>%s</td></tr>
                        <tr><td><b>Category</b></td><td>%s</td></tr>
                        <tr><td><b>Supplier</b></td><td>%s</td></tr>
                        <tr><td><b>Current Stock</b></td>
                            <td style="color:red;">%d units</td></tr>
                        <tr><td><b>Threshold</b></td><td>%d units</td></tr>
                    </table>
                    <p>Please restock immediately or contact the supplier.</p>
                </body>
                </html>
                """.formatted(
                alert.getProductName(),
                alert.getProductSku(),
                alert.getCategoryName(),
                alert.getSupplierName(),
                alert.getCurrentStock(),
                alert.getThreshold()
        );
    }
}
