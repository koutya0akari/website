# frozen_string_literal: true

Rails.application.routes.draw do
  root 'pages#home'

  get 'research', to: 'pages#research'
  get 'teaching', to: 'pages#teaching'
  get 'talks', to: 'pages#talks'
  get 'publications', to: 'pages#publications'
  get 'contact', to: 'pages#contact'
end
