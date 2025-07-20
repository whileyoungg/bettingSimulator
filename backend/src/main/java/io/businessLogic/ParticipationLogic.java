package io.businessLogic;

import io.datarecords.Event;
import io.datarecords.Participation;
import io.persistence.EventRepository;
import io.persistence.ParticipationRepository;
import io.persistence.PersistenceException;

import java.util.ArrayList;
import java.util.stream.Collectors;

public class ParticipationLogic {

    private ParticipationRepository participationRepository;

    public ParticipationLogic(ParticipationRepository participationRepository) {
        this.participationRepository = participationRepository;
    }
    public void addParticipation(Participation participation) throws BusinessLogicException{
        try{
            EventRepository eventRepository = new EventRepository();
            Event event = eventRepository.getAll().stream().filter(event1 -> event1.eventId()==participation.action().event().eventId()).findFirst().orElse(null);
            if (participation.user().balance() < participation.stake()) {
                throw new BusinessLogicException("Insufficient balance to place this stake.");
            }
            if (participation.stake() > event.stakeLimit()) {
                throw new BusinessLogicException("Stake exceeds the allowed limit for this event.\n Stake:"+
                        participation.stake() +"\n Stake limit :" + participation.action().event().stakeLimit() +"\n User balance:"+
                        participation.user().balance());
            }
            if(participation.stake()<=0){
                throw new BusinessLogicException("Stake cannot be less or equal to 0");
            }
            participationRepository.addParticipation(participation);
        } catch (PersistenceException e) {
            throw new BusinessLogicException("Stake cannot be less or equal to 0");
        }
    }
    public ArrayList<Participation> getEventParticipations(int eventId) throws BusinessLogicException{
        ArrayList<Participation> participations = null;
        try {
            participations = participationRepository.getAll();
        } catch (PersistenceException e) {
            throw new BusinessLogicException("Impossible to retrieve participations");
        }
        return participations.stream().filter(participation -> participation.action().event().eventId()==eventId).collect(Collectors.toCollection(ArrayList::new));

    }
}
