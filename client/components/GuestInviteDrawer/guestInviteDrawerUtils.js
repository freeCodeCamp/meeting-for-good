export const fullUrl = event => `${location.protocol}//${location.hostname}${(location.port ? `:${location.port}` : '')}/event/${event._id}`;

export const emailText = event => `Hey there,%0D%0A%0D%0AUse this tool to let me know your availablility for ${event.name}:
    %0D%0A%0D%0A${fullUrl(event)}
    %0D%0A%0D%0A All times will be automatically converted to your local timezone.`;
