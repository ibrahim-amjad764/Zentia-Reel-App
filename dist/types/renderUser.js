// Safely render user as a string
export function renderUser(user) {
    if (!user)
        return "Unknown User";
    return `${user.firstName} ${user.lastName} (${user.email})`;
}
