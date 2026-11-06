package org.entando.hello;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;

// The security rules of hello-ms: which web addresses need a signed-in user, and which roles.
@Configuration
@EnableMethodSecurity // turns on @PreAuthorize in the controllers
public class SecurityConfig {

    @Bean
    SecurityFilterChain rules(HttpSecurity http, JwtAuthenticationConverter keycloakRoles) throws Exception {
        // Before a call with a token, the browser asks first (OPTIONS, without the token) if the call is allowed:
        // answer with the @CrossOrigin rules of the controller, before checking any token.
        http.cors(Customizer.withDefaults())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/secret").authenticated() // needs a valid Keycloak token
                .anyRequest().permitAll()) // everything else stays public
            // Accept tokens (JWT) only if Keycloak signed them: see issuer-uri in application.yml.
            // The converter turns the Keycloak roles of the token into Spring authorities.
            .oauth2ResourceServer(oauth -> oauth.jwt(jwt -> jwt.jwtAuthenticationConverter(keycloakRoles)));
        return http.build();
    }

    // Keycloak writes the client roles of the user into the token, under the client that owns them:
    //   "resource_access": { "internal": { "roles": ["hello-user"] } }
    // Spring Security does not read this claim by itself: here we turn each role into an authority.
    @Bean
    JwtAuthenticationConverter keycloakRoles(@Value("${hello.keycloak.client-id}") String clientId) {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(token -> clientRoles(token, clientId));
        return converter;
    }

    // Reads only the roles of our own client: a role with the same name on another client does not count.
    static Collection<GrantedAuthority> clientRoles(Jwt token, String clientId) {
        Map<String, Object> resourceAccess = token.getClaimAsMap("resource_access");
        if (resourceAccess == null || !(resourceAccess.get(clientId) instanceof Map<?, ?> client)) {
            return List.of(); // no roles for our client in this token
        }
        List<GrantedAuthority> authorities = new ArrayList<>();
        if (client.get("roles") instanceof Collection<?> roles) {
            for (Object role : roles) {
                authorities.add(new SimpleGrantedAuthority(role.toString()));
            }
        }
        return authorities;
    }
}
