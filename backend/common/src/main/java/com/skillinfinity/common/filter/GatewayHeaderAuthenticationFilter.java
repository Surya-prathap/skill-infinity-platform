package com.skillinfinity.common.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

/**
 * Trusts the identity headers injected by the API gateway after JWT
 * validation ({@code X-User-ID} and {@code X-User-Roles}) and populates the
 * Spring Security context from them.
 * <p>
 * Every backend service sits behind the gateway, which is the only entry
 * point that can mint these headers (it strips any client-supplied values and
 * re-sets them from the validated token). Services therefore simply trust the
 * headers — this filter is what makes {@code anyRequest().authenticated()}
 * and {@code @PreAuthorize} work without each service re-validating the JWT.
 * <p>
 * If the headers are absent (direct access to a service port) the request is
 * left unauthenticated and the normal 401/403 handling applies.
 */
public class GatewayHeaderAuthenticationFilter extends OncePerRequestFilter {

    public static final String USER_ID_HEADER = "X-User-ID";
    public static final String USER_ROLES_HEADER = "X-User-Roles";

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        String userIdHeader = request.getHeader(USER_ID_HEADER);
        if (StringUtils.hasText(userIdHeader)) {
            try {
                UUID userId = UUID.fromString(userIdHeader);
                String rolesHeader = request.getHeader(USER_ROLES_HEADER);
                List<SimpleGrantedAuthority> authorities = Arrays.stream(
                                StringUtils.hasText(rolesHeader) ? rolesHeader.split(",") : new String[0])
                        .map(String::trim)
                        .filter(StringUtils::hasText)
                        .map(SimpleGrantedAuthority::new)
                        .toList();

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(userId, null, authorities);
                SecurityContextHolder.getContext().setAuthentication(authentication);
            } catch (IllegalArgumentException e) {
                // Header present but not a valid UUID — do not authenticate.
                SecurityContextHolder.clearContext();
            }
        } else {
            // No identity header: ensure no stale authentication leaks through.
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }
}
