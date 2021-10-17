import { Query, Resolver } from "type-graphql";

@Resolver()
class HelloResolver {

    @Query(() => String)
    public hello() {
        return "Hello World!";
    }
}

export default HelloResolver