package io.datarecords;

public record Action(int actionId, String action, double coefficient, Event event) {
}
