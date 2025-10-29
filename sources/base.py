# Base Source class for EventTracker

class SourceChecker:
    """
    Base class for all event sources.
    Each source type should inherit from this class and implement CheckForNewEvents.
    """
    
    def __init__(self, type):
        self.type = type

    def CheckForNewEvents(self, lastCheckedTimestamp):
        """
        Abstract method to check for new events from this source.
        Should be implemented by each subclass.
        """
        raise NotImplementedError("Subclasses must implement CheckForNewEvents")
