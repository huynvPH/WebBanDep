package com.example.thi.config;

import com.example.thi.entity.Profile;
import com.example.thi.entity.UserRole;
import com.example.thi.repository.ProfileRepository;
import com.example.thi.repository.UserRoleRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
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

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");

        Profile p = profileRepository.findByEmail(email);
        String role = "customer";
        if (p != null) {
            List<UserRole> roles = userRoleRepository.findAll().stream()
                    .filter(r -> r.getUserId() != null && r.getUserId().equals(p.getId()))
                    .collect(Collectors.toList());
            if (!roles.isEmpty()) {
                role = roles.get(0).getRole();
            }
        }

        // Tạo URL quay lại frontend kèm thông tin user (để demo, ta dùng query param - thực tế nên dùng JWT)
        String targetUrl = UriComponentsBuilder.fromUriString("http://localhost:5173/login-success")
                .queryParam("id", p.getId())
                .queryParam("username", p.getUsername())
                .queryParam("fullName", p.getFullName())
                .queryParam("role", role)
                .build().toUriString();

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
