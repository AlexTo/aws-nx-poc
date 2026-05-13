$version: "2.0"

namespace aws.nx.poc

/// An example operation
@http(method: "GET", uri: "/echo")
@readonly
operation Echo {
    input := {
        @httpQuery("message")
        @required
        message: String
    }
    output := {
        @required
        message: String
    }
}
