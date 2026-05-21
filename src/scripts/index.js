import {
  addCard,
  changeLikeCardStatus,
  deleteCardApi,
  getCardList,
  getUserInfo,
  setUserAvatar,
  setUserInfo,
} from "./components/api.js";
import { createCardElement } from "./components/card.js";
import {
  closeModalWindow,
  openModalWindow,
  setCloseModalWindowEventListeners,
} from "./components/modal.js";

// DOM узлы
const placesWrap = document.querySelector(".places__list");
const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(".popup__input_type_description");

const cardFormModalWindow = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModalWindow.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");

const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");

const cardInfoModalWindow = document.querySelector(".popup_type_info");
const cardInfoModalTitle = cardInfoModalWindow.querySelector(".popup__title");
const cardInfoModalInfo = cardInfoModalWindow.querySelector(".popup__info");
const cardInfoModalText = cardInfoModalWindow.querySelector(".popup__text");
const cardInfoModalList = cardInfoModalWindow.querySelector(".popup__list");

const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");

const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");

const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input");
const profileSubmitButton = profileForm.querySelector(".popup__button");
const cardSubmitButton = cardForm.querySelector(".popup__button");
const avatarSubmitButton = avatarForm.querySelector(".popup__button");

const infoDefinitionTemplate = document.getElementById("popup-info-definition-template");
const infoUserPreviewTemplate = document.getElementById("popup-info-user-preview-template");

let currentUserId = "";
let currentUserData = null;

const formatDate = (date) =>
  date.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const createInfoString = (term, description) => {
  const infoItem = infoDefinitionTemplate.content
    .querySelector(".popup__info-item")
    .cloneNode(true);

  infoItem.querySelector(".popup__info-term").textContent = term;
  infoItem.querySelector(".popup__info-description").textContent = description;

  return infoItem;
};

const createUserPreview = (user) => {
  const previewItem = infoUserPreviewTemplate.content
    .querySelector(".popup__list-item")
    .cloneNode(true);

  previewItem.textContent = user.name;
  previewItem.title = user.name;

  return previewItem;
};

const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};

const handleInfoClick = (cardId) => {
  getCardList()
    .then((cards) => {
      const cardData = cards.find((card) => card._id === cardId);

      if (!cardData) {
        return;
      }

      cardInfoModalTitle.textContent = cardData.name;
      cardInfoModalInfo.replaceChildren(
        createInfoString("Автор:", cardData.owner.name),
        createInfoString("Дата создания:", formatDate(new Date(cardData.createdAt))),
        createInfoString("Лайков:", String(cardData.likes.length))
      );
      cardInfoModalText.textContent = "Пользователи, лайкнувшие карточку";
      cardInfoModalList.replaceChildren(...cardData.likes.map(createUserPreview));
      openModalWindow(cardInfoModalWindow);
    })
    .catch((err) => {
      console.log(err);
    });
};

const handleCardLike = ({ cardData, likeButton, likeCount }) => {
  const isLiked = likeButton.classList.contains("card__like-button_is-active");

  changeLikeCardStatus(cardData._id, isLiked)
    .then((updatedCard) => {
      cardData.likes = updatedCard.likes;
      likeButton.classList.toggle(
        "card__like-button_is-active",
        updatedCard.likes.some((user) => user._id === currentUserId)
      );
      likeCount.textContent = updatedCard.likes.length;
    })
    .catch((err) => {
      console.log(err);
    });
};

const handleCardDelete = ({ cardData, cardElement }) => {
  deleteCardApi(cardData._id)
    .then(() => {
      cardElement.remove();
    })
    .catch((err) => {
      console.log(err);
    });
};

const setButtonText = (buttonElement, text) => {
  buttonElement.textContent = text;
};

const renderCard = (cardData) => {
  placesWrap.append(
    createCardElement(cardData, {
      currentUserId,
      onPreviewPicture: handlePreviewPicture,
      onLikeCard: handleCardLike,
      onDeleteCard: handleCardDelete,
      onInfoClick: handleInfoClick,
    })
  );
};

const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();
  setButtonText(profileSubmitButton, "Сохранение...");

  setUserInfo({
    name: profileTitleInput.value,
    about: profileDescriptionInput.value,
  })
    .then((userData) => {
      currentUserData = userData;
      profileTitle.textContent = userData.name;
      profileDescription.textContent = userData.about;
      closeModalWindow(profileFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      setButtonText(profileSubmitButton, "Сохранить");
    });
};

const handleAvatarFromSubmit = (evt) => {
  evt.preventDefault();
  setButtonText(avatarSubmitButton, "Сохранение...");

  setUserAvatar({
    avatar: avatarInput.value,
  })
    .then((userData) => {
      currentUserData = userData;
      profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
      closeModalWindow(avatarFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      setButtonText(avatarSubmitButton, "Сохранить");
    });
};

const handleCardFormSubmit = (evt) => {
  evt.preventDefault();
  setButtonText(cardSubmitButton, "Создание...");

  addCard({
    name: cardNameInput.value,
    link: cardLinkInput.value,
  })
    .then((newCard) => {
      placesWrap.prepend(
        createCardElement(newCard, {
          currentUserId,
          onPreviewPicture: handlePreviewPicture,
          onLikeCard: handleCardLike,
          onDeleteCard: handleCardDelete,
          onInfoClick: handleInfoClick,
        })
      );
      cardForm.reset();
      closeModalWindow(cardFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      setButtonText(cardSubmitButton, "Создать");
    });
};

// EventListeners
profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFromSubmit);

openProfileFormButton.addEventListener("click", () => {
  profileTitleInput.value = currentUserData ? currentUserData.name : profileTitle.textContent;
  profileDescriptionInput.value = currentUserData
    ? currentUserData.about
    : profileDescription.textContent;
  openModalWindow(profileFormModalWindow);
});

profileAvatar.addEventListener("click", () => {
  avatarForm.reset();
  openModalWindow(avatarFormModalWindow);
});

openCardFormButton.addEventListener("click", () => {
  cardForm.reset();
  openModalWindow(cardFormModalWindow);
});

Promise.all([getCardList(), getUserInfo()])
  .then(([cards, userData]) => {
    currentUserId = userData._id;
    currentUserData = userData;

    profileTitle.textContent = userData.name;
    profileDescription.textContent = userData.about;
    profileAvatar.style.backgroundImage = `url(${userData.avatar})`;

    cards.forEach((card) => {
      renderCard(card);
    });
  })
  .catch((err) => {
    console.log(err);
  });

const allPopups = document.querySelectorAll(".popup");
allPopups.forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});
