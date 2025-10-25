# frozen_string_literal: true

Rails.application.routes.draw do
  root 'pages#home'

  get 'about', to: 'pages#about'
  get 'diary', to: 'pages#diary'

  get 'login', to: 'sessions#new'
  post 'login', to: 'sessions#create'
  delete 'logout', to: 'sessions#destroy'

  resources :diary_entries, only: %i[create destroy]

  get 'research', to: 'pages#research'
  get 'teaching', to: 'pages#teaching'
  get 'talks', to: 'pages#talks'
  get 'publications', to: 'pages#publications'
  get 'contact', to: 'pages#contact'
end
