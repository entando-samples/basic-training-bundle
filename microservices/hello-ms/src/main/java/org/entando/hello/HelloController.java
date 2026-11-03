package org.entando.hello;

import java.util.Map;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

// The REST endpoints of hello-ms: each method answers one web address with JSON.
@RestController
@CrossOrigin(originPatterns = "http://localhost:*") // lets the local test page call us
public class HelloController {

    @GetMapping("/api/health")
    public Map<String, String> health() {
        return Map.of("status", "UP");
    }

    @GetMapping("/api/hello")
    public Map<String, String> hello() {
        return Map.of("message", "Hello from hello-ms!");
    }
}
