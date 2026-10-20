
export type User = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
};

export type Sport = {
  id: number;
  name: string;
  description: string;
  price: number;
};

export type Schedule = {
  id: number;
  sportId: number;
  sportName: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  capacity: number;
};

export type Registration = {
  id: number;
  userId: number;
  scheduleId: number;
  registrationDate: string;
  status: string;
};

export type Payment = {
  id: number;
  userId: number;
  amount: number;
  startDate: string;
  endDate: string;
  status: string;
};
