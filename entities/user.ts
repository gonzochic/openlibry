import { PrismaClient } from "@prisma/client";

export async function getUser(client: PrismaClient, id: number) {
  return client.user.findUnique({ where: { id } });
}

export async function countUser(client: PrismaClient) {
  return client.user.count({});
}

export async function addUser(client: PrismaClient, name: string) {
  return client.user.create({
    data: { name: name },
  });
}

export async function updateUser(
  client: PrismaClient,
  id: number,
  name: string
) {
  return client.user.update({
    where: {
      id,
    },
    data: { name: name },
  });
}

export async function deleteUser(client: PrismaClient, id: number) {
  return client.user.delete({
    where: {
      id,
    },
  });
}
