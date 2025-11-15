package com.email.writer.Controller;


import com.email.writer.Model.EmailRequest;
import com.email.writer.Service.EmailGeneratorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/email")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class EmailGeneratorController {

    private final EmailGeneratorService emailGeneratorService;

    @PostMapping("/generate")
    public ResponseEntity<String> generateEmail(@RequestBody EmailRequest emailRequest) {
        return new ResponseEntity<>(emailGeneratorService.generateEmailReply(emailRequest), HttpStatus.OK);
    }

    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return new ResponseEntity<>(HttpStatus.OK);
    }
}
