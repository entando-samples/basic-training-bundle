package org.entando.hello;

import java.util.Map;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

// The REST endpoints of hello-ms: each method answers one web address with JSON.
@RestController
@CrossOrigin(originPatterns = "http://localhost:*") // lets the local test page call us
public class HelloController {

    private final JdbcTemplate database;

    public HelloController(JdbcTemplate database) {
        this.database = database;
        database.execute("CREATE TABLE IF NOT EXISTS visits (id SERIAL PRIMARY KEY)");
    }

    @GetMapping("/api/health")
    public Map<String, String> health() {
        return Map.of("status", "UP");
    }

    @GetMapping("/api/hello")
    public Map<String, Object> hello() {
        database.update("INSERT INTO visits DEFAULT VALUES");
        Integer visits = database.queryForObject("SELECT COUNT(*) FROM visits", Integer.class);
        return Map.of("message", "Hello from hello-ms!", "visits", visits);
    }

    @GetMapping("/api/secret")
    @PreAuthorize("hasAuthority('hello-user')") // signed in AND with the role hello-user, else 403
    public Map<String, String> secret(@AuthenticationPrincipal Jwt token) {
        String user = token.getClaimAsString("preferred_username");
        return Map.of("message", "Hello " + user + ", only signed-in users can read this.");
    }
}
