import { UserDocument } from '../schemas/user.schema';

export class User {
  id: string;
  name?: string;
  email: string;

  static fromDocument(userDocument: UserDocument): User {
    return {
      id: userDocument._id,
      name: userDocument.name,
      email: userDocument.email,
    };
  }
}
