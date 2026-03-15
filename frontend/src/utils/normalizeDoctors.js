export const normalizeDoctors = (users = [], invites = []) => {
  const activeDoctors = users.map((d) => {
    let status = "PENDING_APPROVAL";

    if (d.hospitalApproved && !d.isProfileComplete) {
      status = "APPROVED_PENDING_PROFILE";
    }

    if (d.hospitalApproved && d.isProfileComplete) {
      status = "ACTIVE";
    }

    return {
      id: d._id,
      email: d.email,
      status,
      isActive: d.isActive,
      source: "user",
    };
  });

  const pendingDoctors = invites.map((i) => ({
    id: i._id,
    email: i.email,
    status: "PENDING_SIGNUP",
    isActive: true,
    source: "invite",
  }));

  return [...pendingDoctors, ...activeDoctors];
};