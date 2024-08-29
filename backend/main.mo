import Bool "mo:base/Bool";
import Nat "mo:base/Nat";

import Array "mo:base/Array";
import Time "mo:base/Time";
import Int "mo:base/Int";
import Text "mo:base/Text";
import Option "mo:base/Option";
import Result "mo:base/Result";
import Debug "mo:base/Debug";
import Principal "mo:base/Principal";

actor {
  type Post = {
    id: Nat;
    title: Text;
    content: Text;
    timestamp: Int;
    author: ?Text;
    authorPrincipal: ?Principal;
  };

  stable var posts : [Post] = [];
  stable var nextId : Nat = 0;

  public shared query({caller}) func whoami() : async Text {
    Principal.toText(caller)
  };

  public query func getPosts() : async [Post] {
    Array.sort(posts, func(a: Post, b: Post) : { #less; #equal; #greater } {
      Int.compare(b.timestamp, a.timestamp)
    })
  };

  public shared({caller}) func createPost(title: Text, content: Text, author: ?Text) : async Result.Result<Post, Text> {
    let post : Post = {
      id = nextId;
      title = title;
      content = content;
      timestamp = Time.now();
      author = author;
      authorPrincipal = ?caller;
    };
    posts := Array.append(posts, [post]);
    nextId += 1;
    #ok(post)
  };

  public query func getPostById(id: Nat) : async ?Post {
    Array.find(posts, func(p: Post) : Bool { p.id == id })
  };

  // System functions for upgrades
  system func preupgrade() {
    Debug.print("Preparing to upgrade. Total posts: " # Int.toText(posts.size()));
  };

  system func postupgrade() {
    Debug.print("Upgrade complete. Total posts: " # Int.toText(posts.size()));
  };
}
