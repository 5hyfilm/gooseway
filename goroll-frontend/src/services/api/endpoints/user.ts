import apiFetch from "../api";
import { 
  UserFindAllBody, 
  UserFindAllResult, 
  UserWithWheelchair, 
  CreateUserBody, 
  UpdateUserBody 
} from "@/lib/types/user";

export const findAllUsers = async (body: UserFindAllBody): Promise<UserFindAllResult> => {
  const response = await apiFetch.post("/users/admin/findAll", body);
  return {
    data: response.data.data,
    total: response.data.total,
  };
} 

export const getUserById = async (id: number): Promise<UserWithWheelchair> => {
  const response = await apiFetch.get(`/users/admin/findById/${id}`);
  return response.data;
}

export const createUser = async (body: CreateUserBody): Promise<CreateUserBody> => {
  const response = await apiFetch.post("/users/admin/insert", body);  
  return response.data;
};

export const updateUser = async (
  body: UpdateUserBody
): Promise<UpdateUserBody> => {
  const response = await apiFetch.post("/users/admin/update", body);
  return response.data;
};

export const deleteUser = async (id: number): Promise<void> => {
  await apiFetch.delete(`/users/admin/delete/${id}`);
}

export const exportUsers = async (): Promise<ArrayBuffer> => {
  const response = await apiFetch.post("/users/admin/export", {}, {
    responseType: 'arraybuffer'
  });
  return response.data;
};