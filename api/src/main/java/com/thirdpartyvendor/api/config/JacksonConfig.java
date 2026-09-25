package com.thirdpartyvendor.api.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.fasterxml.jackson.databind.ObjectMapper;

@Configuration
public class JacksonConfig {

	@Bean
	ObjectMapper objectMapper() {
		return new ObjectMapper();
	}

}