package org.entando.hello;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;

import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.JwtRequestPostProcessor;
import org.springframework.test.web.servlet.MockMvc;

// Automatic checks of hello-ms. Run them with: mvn test
@SpringBootTest
@AutoConfigureMockMvc
class HelloControllerTest {

    @Autowired
    MockMvc mvc; // calls our endpoints without a real web server

    @MockitoBean
    JdbcTemplate database; // a fake database, so the tests don't need PostgreSQL

    @Test
    void helloAnswersWithAMessage() throws Exception {
        when(database.queryForObject(anyString(), eq(Integer.class))).thenReturn(1);
        mvc.perform(get("/api/hello"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.message").value("Hello from hello-ms!"));
    }

    @Test
    void secretNeedsAValidTokenAndTheHelloUserRole() throws Exception {
        // No token: 401 Unauthorized.
        mvc.perform(get("/api/secret")).andExpect(status().isUnauthorized());
        // A valid token, but without the role: 403 Forbidden.
        mvc.perform(get("/api/secret").with(keycloakToken(Map.of())))
            .andExpect(status().isForbidden());
        // The role on another client does not count: 403 Forbidden.
        mvc.perform(get("/api/secret").with(keycloakToken(Map.of("other-client", Map.of("roles", List.of("hello-user"))))))
            .andExpect(status().isForbidden());
        // A valid token with the role hello-user on our client: 200 OK.
        mvc.perform(get("/api/secret").with(keycloakToken(Map.of("internal", Map.of("roles", List.of("hello-user"))))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.message").value("Hello admin, only signed-in users can read this."));
    }

    // A fake Keycloak token for user "admin" with the given "resource_access" claim.
    // Its roles are read by the same code that hello-ms uses for the real tokens.
    private static JwtRequestPostProcessor keycloakToken(Map<String, Object> resourceAccess) {
        return jwt()
            .jwt(t -> t.claim("preferred_username", "admin").claim("resource_access", resourceAccess))
            .authorities(t -> SecurityConfig.clientRoles(t, "internal"));
    }
}
