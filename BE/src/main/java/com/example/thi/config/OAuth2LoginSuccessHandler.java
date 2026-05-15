package com.example.thi.config;

import com.example.thi.entity.Profile;
import com.example.thi.entity.UserRole;
import com.example.thi.repository.ProfileRepository;
import com.example.thi.repository.UserRoleRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    private UserRoleRepository userRoleRepository;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        System.out.println("OAuth2 Login Success for email: " + email);

        Profile p = profileRepository.findByEmail(email);
        String role = "customer";
        
        if (p == null) {
            System.err.println("CRITICAL: Profile not found for email " + email + " after OAuth2 success");
            response.sendRedirect(frontendUrl + "/login?error=user_not_found");
            return;
        }

        List<UserRole> roles = userRoleRepository.findAll().stream()
                .filter(r -> r.getUserId() != null && r.getUserId().equals(p.getId()))
                .collect(Collectors.toList());
        if (!roles.isEmpty()) {
            role = roles.get(0).getRole();
        }

        System.out.println("Redirecting to frontend for user: " + p.getUsername());

        // Không tự động chuyển hướng nữa để tránh bị trình duyệt chặn
        String targetUrl = frontendUrl + "/login-success";

        response.setContentType("text/html;charset=UTF-8");
        response.getWriter().write(
            "<html>" +
            "<head><meta charset='UTF-8'></head>" +
            "<body style='display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif;'>" +
            "   <div style='padding: 40px; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); text-align: center;'>" +
            "       <h2 style='color: #10b981;'>Đăng nhập Google thành công!</h2>" +
            "       <p>Chào mừng <b>" + p.getFullName() + "</b> quay trở lại.</p>" +
            "       <a href='" + targetUrl + "' style='display: inline-block; margin-top: 20px; padding: 12px 30px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 99px; font-weight: bold;'>Tiếp tục quay lại trang web</a>" +
            "   </div>" +
            "</body>" +
            "</html>"
        );
    }
}
