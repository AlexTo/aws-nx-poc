$version: "2.0"

namespace aws.nx.poc

use aws.protocols#restJson1
use smithy.framework#ValidationException

/// TODO: describe your service here
@title("Smithy")
@restJson1
service Smithy {
    version: "1.0.0"
    operations: [
        Echo
    ]
    errors: [
        ValidationException
    ]
}
