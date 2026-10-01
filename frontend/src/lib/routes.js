/** Where a signed-in user lands after login or sign-up. */
export const homePath = (user) => (user?.user?.role === "admin" ? "/adminpage" : "/home");
