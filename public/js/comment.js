// Button New Comment
var newComment = document.getElementById("new-comment");
var clientComment = document.getElementById("client-comment");
var serverComment = document.getElementById("server-comment");

// Send the comment from Client -> Server
if (newComment != null) {
  newComment.addEventListener("click", () => {
    serverComment.value = clientComment.textContent || clientComment.innerText;
  })
}
