import { Post } from '../entities/Post';
import { Arg, Ctx, Int, Mutation, Query, Resolver } from 'type-graphql';
import { MyContext } from 'src/types';

@Resolver()
class PostResolver {

    @Query(() => [Post])
    public posts(@Ctx() { em }: MyContext): Promise<Post[]> {
        return em.find(Post, {});
    }

    @Query(() => Post, { nullable: true })
    public post(
        @Arg('id', () => Int) id: number,
        @Ctx() { em }: MyContext): Promise<Post | null> {
        return em.findOne(Post, { id });
    }

    @Mutation(() => Post)
    public async createPost(
        @Arg('title', () => String) title: string,
        @Ctx() { em }: MyContext): Promise<Post | null> {
        const post = em.create(Post, { title });
        await em.persistAndFlush(post);
        return post;
    }

    @Mutation(() => Post, { nullable: true })
    public async updatePost(
        @Arg('id', () => Int) id: number,
        @Arg('title', () => String) title: string,
        @Ctx() { em }: MyContext): Promise<Post | null> {
        const post = await em.findOne(Post, { id });
        if (!post) {
            return null
        }

        if (typeof title !== 'undefined') {
            post.title = title
            await em.persistAndFlush(post);
        }

        return post
    }

    @Mutation(() => Boolean)
    public async deletePost(
        @Arg('id', () => Int) id: number,
        @Ctx() { em }: MyContext): Promise<boolean> {
        em.nativeDelete(Post, { id });
        return true
    }
}

export default PostResolver