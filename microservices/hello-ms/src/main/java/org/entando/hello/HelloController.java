package org.entando.hello;

import java.util.Map;
import org.springframework.jdbc.core.JdbcTemplate;
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
}
