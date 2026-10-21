package com.thirdpartyvendor.api.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "watchlist")
@IdClass(WatchlistId.class)
public class Watchlist {

	@Id
	@Column(name = "user_id", nullable = false)
	private Long userId;

	@Id
	@Column(name = "ticker", nullable = false)
	private String ticker;
}
