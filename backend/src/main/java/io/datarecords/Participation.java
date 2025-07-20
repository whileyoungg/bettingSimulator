package io.datarecords;

public record Participation(Action action,User user, double stake, double potentialWin, boolean hasWon){

}
