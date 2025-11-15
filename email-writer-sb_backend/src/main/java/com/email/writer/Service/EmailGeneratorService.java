package com.email.writer.Service;

import com.email.writer.Model.EmailRequest;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;


@Service
public class EmailGeneratorService {

    @Value("${gemini.api.url}")
    private String geminiApiUri;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    private final WebClient webClient;


    public EmailGeneratorService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    public String generateEmailReply(EmailRequest emailRequest) {
        // Build the prompt
        String prompt = buildPrompt(emailRequest);

        // Build requestBody
        Map<String, Object> requestBody = Map.of(
                "contents", new Object[]{
                        Map.of(
                                "parts", new Object[]{
                                        Map.of("text", prompt)
                                }
                        )
                }
        );

        // get the response from api
        String geminiResponse = webClient.post()
                                         .uri(geminiApiUri + "?key=" + geminiApiKey)
                                         .header("Content-Type", "application/json")
                                         .bodyValue(requestBody)
                                         .retrieve()
                                         .bodyToMono(String.class)
                                         .block();

        // return the response
        return extreactEmailContent(geminiResponse);

    }

    private String buildPrompt(EmailRequest emailRequest) {
        StringBuilder prompt = new StringBuilder();

        prompt.append(
                "Generate a professional email reply for the following email content. Please don't generate a subject line.\n");

        if (emailRequest.getTone() != null && !emailRequest.getTone().isEmpty()) {
            prompt.append("use a ").append(emailRequest.getTone()).append("tone. \n");
        }

        prompt.append("Email Content: \n").append(emailRequest.getEmailContent());

        return prompt.toString();
    }

    private String extreactEmailContent(String geminiResponse) {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode response = objectMapper.readTree(geminiResponse);

            return response
                    .path("candidates")
                    .get(0)
                    .path("content")
                    .path("parts")
                    .get(0)
                    .path("text")
                    .asText();

        } catch (JsonProcessingException e) {
            return "Error while processing the response" + e.getMessage();
        }
    }
}
