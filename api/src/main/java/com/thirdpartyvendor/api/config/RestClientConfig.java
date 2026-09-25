package com.thirdpartyvendor.api.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class RestClientConfig {

	@Bean
	RestClient.Builder restClientBuilder() {
		return RestClient.builder();
	}

}