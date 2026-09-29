package com.thirdpartyvendor.api.error;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatusCode;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.thirdpartyvendor.api.error.AuthExceptions.ForbiddenException;
import com.thirdpartyvendor.api.error.OrderExceptions.BadOrderException;

class GlobalExceptionHandlerTest {

	private MockMvc mockMvc;

	@BeforeEach
	void setUp() {
		mockMvc = MockMvcBuilders.standaloneSetup(new TestErrorController())
			.setControllerAdvice(new GlobalExceptionHandler())
			.build();
	}

	@Test
	void handlesResponseStatusException() throws Exception {
		mockMvc.perform(get("/errors/status"))
			.andExpect(status().is(422))
			.andExpect(jsonPath("$.status").value(422))
			.andExpect(jsonPath("$.error").value("Unprocessable Content"))
			.andExpect(jsonPath("$.message").value("Validation failed"))
			.andExpect(jsonPath("$.path").value("/errors/status"));
	}

	@Test
	void handlesCustomForbiddenException() throws Exception {
		mockMvc.perform(get("/errors/forbidden"))
			.andExpect(status().isForbidden())
			.andExpect(jsonPath("$.status").value(403))
			.andExpect(jsonPath("$.error").value("Forbidden"))
			.andExpect(jsonPath("$.message").value("Only an admin can perform this action."))
			.andExpect(jsonPath("$.path").value("/errors/forbidden"));
	}

	@Test
	void handlesUnexpectedException() throws Exception {
		mockMvc.perform(get("/errors/unexpected"))
			.andExpect(status().isInternalServerError())
			.andExpect(jsonPath("$.status").value(500))
			.andExpect(jsonPath("$.error").value("Internal Server Error"))
			.andExpect(jsonPath("$.message").value("An unexpected error occurred"))
			.andExpect(jsonPath("$.path").value("/errors/unexpected"));
	}

	@Test
	void handlesBadOrderException() throws Exception {
		mockMvc.perform(get("/errors/bad-order"))
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath("$.status").value(400))
			.andExpect(jsonPath("$.error").value("Bad Request"))
			.andExpect(jsonPath("$.message").value("Order currency is required"))
			.andExpect(jsonPath("$.path").value("/errors/bad-order"));
	}

	@RestController
	@RequestMapping("/errors")
	static class TestErrorController {

		@GetMapping("/status")
		void statusError() {
			throw new ResponseStatusException(HttpStatusCode.valueOf(422), "Validation failed");
		}

		@GetMapping("/forbidden")
		void forbiddenError() {
			throw new ForbiddenException("Only an admin can perform this action.");
		}

		@GetMapping("/unexpected")
		void unexpectedError() {
			throw new IllegalStateException("boom");
		}

		@GetMapping("/bad-order")
		void badOrderError() {
			throw new BadOrderException("Order currency is required");
		}
	}
}