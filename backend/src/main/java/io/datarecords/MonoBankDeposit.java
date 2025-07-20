package io.datarecords;

import java.time.Instant;

public record MonoBankDeposit(double amount, String description, Instant depositDate) {
}
