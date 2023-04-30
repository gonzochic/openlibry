import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import customParseFormat from "dayjs/plugin/customParseFormat";
import utc from "dayjs/plugin/utc";
import { User } from "@prisma/client";
import { UserType } from "@/entities/UserType";

export const TIMEZONE = "Europe/Berlin";
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

export function convertDateToDayString(d: Date) {
  const convertedDate = dayjs(d);
  return convertedDate.format("YYYY-MM-DD");
}

export function replaceUsersDateString(users: Array<User>): Array<UserType> {
  const convertedUsers = users.map((u) => {
    return {
      ...u,
      createdAt: convertDateToDayString(u.createdAt),
      updatedAt: convertDateToDayString(u.updatedAt),
    };
  });
  return convertedUsers;
}

export function replaceUserDateString(user: User): UserType {
  return {
    ...user,
    createdAt: convertDateToDayString(user.createdAt),
    updatedAt: convertDateToDayString(user.updatedAt),
  };
}