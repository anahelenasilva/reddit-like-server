import { User } from '../entities/User';
import { MyContext } from 'src/types';
import { Arg, Ctx, Field, InputType, Mutation, ObjectType, Resolver } from 'type-graphql';
import argon2 from 'argon2';

@InputType()
class UsernamePasswordInput {
  @Field()
  username: string;
  @Field()
  password: string;
}

@ObjectType()
class FieldError {
  @Field()
  field: string;

  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[]

  @Field(() => User, { nullable: true })
  user?: User
}

@Resolver()
class UserResolver {

  @Mutation(() => UserResponse)
  public async register(
    @Arg('options', () => UsernamePasswordInput) options: UsernamePasswordInput,
    @Ctx() { em }: MyContext
  ): Promise<UserResponse> {
    if (!options || !options.username || !options.password) {
      return {
        errors: [{
          field: 'username',
          message: 'Username and password are required'
        }]
      }
    }

    if (options.password.length <= 2) {
      return {
        errors: [{
          field: 'password',
          message: 'Password must be at least 2 characters long'
        }]
      }
    }

    if (options.username.length <= 2) {
      return {
        errors: [{
          field: 'username',
          message: 'Username must be at least 2 characters long'
        }]
      }
    }

    const hashedPassword = await argon2.hash(options.password);
    const user = em.create(User, { username: options.username, password: hashedPassword })

    try {
      await em.persistAndFlush(user);
    } catch (error) {
      if (error.code === '23505') {
        return {
          errors: [{
            field: 'username',
            message: 'Username already exists'
          }]
        }
      }
    }

    return { user }
  }

  @Mutation(() => UserResponse)
  public async login(
    @Arg('options', () => UsernamePasswordInput) options: UsernamePasswordInput,
    @Ctx() { em }: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(User, { username: options.username });
    if (!user) {
      return {
        errors: [{
          field: 'username',
          message: 'User not found'
        }]
      }
    }

    const valid = await argon2.verify(user.password, options.password);

    if (!valid) {
      return {
        errors: [{
          field: 'password',
          message: 'Invalid password'
        }]
      }
    }

    return {
      user
    }
  }
}

export default UserResolver