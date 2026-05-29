const getTemplate = () => {
  return document
    .getElementById("card-template")
    .content.querySelector(".card")
    .cloneNode(true);
};

export const removeCardElement = (cardElement) => {
  cardElement.remove();
};

export const updateCardLikeState = (cardElement, likes, currentUserId) => {
  const likeButton = cardElement.querySelector(".card__like-button");
  const likeCount = cardElement.querySelector(".card__like-count");

  likeButton.classList.toggle(
    "card__like-button_is-active",
    likes.some((user) => user._id === currentUserId)
  );
  likeCount.textContent = likes.length;
};

export const createCardElement = (
  data,
  { currentUserId, onPreviewPicture, onLikeCard, onDeleteCard, onInfoClick }
) => {
  const cardElement = getTemplate();
  const likeButton = cardElement.querySelector(".card__like-button");
  const likeCount = cardElement.querySelector(".card__like-count");
  const deleteButton = cardElement.querySelector(".card__control-button_type_delete");
  const infoButton = cardElement.querySelector(".card__control-button_type_info");
  const cardImage = cardElement.querySelector(".card__image");

  cardImage.src = data.link;
  cardImage.alt = data.name;
  cardElement.querySelector(".card__title").textContent = data.name;
  likeCount.textContent = data.likes.length;

  const isOwner = data.owner && data.owner._id === currentUserId;
  const isLiked = data.likes.some((user) => user._id === currentUserId);

  if (!isOwner) {
    deleteButton.remove();
  }

  if (isLiked) {
    likeButton.classList.add("card__like-button_is-active");
  }

  if (onLikeCard) {
    likeButton.addEventListener("click", () =>
      onLikeCard({ cardData: data, cardElement, likeButton, likeCount })
    );
  }

  if (isOwner && onDeleteCard) {
    deleteButton.addEventListener("click", () =>
      onDeleteCard({ cardData: data, cardElement })
    );
  }

  if (onPreviewPicture) {
    cardImage.addEventListener("click", () =>
      onPreviewPicture({ name: data.name, link: data.link })
    );
  }

  if (infoButton && onInfoClick) {
    infoButton.addEventListener("click", () => onInfoClick(data._id));
  }

  return cardElement;
};
