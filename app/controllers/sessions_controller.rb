# frozen_string_literal: true

class SessionsController < ApplicationController
  def new
    redirect_to diary_path if logged_in?
  end

  def create
    email = session_params[:email].to_s.downcase.strip
    user = User.find_by('LOWER(email) = ?', email)

    if user&.authenticate(session_params[:password])
      session[:user_id] = user.id
      redirect_to diary_path, notice: 'ログインしました。'
    else
      flash.now[:alert] = 'メールアドレスまたはパスワードが正しくありません。'
      render :new, status: :unprocessable_entity
    end
  end

  def destroy
    reset_session
    redirect_to diary_path, notice: 'ログアウトしました。'
  end

  private

  def session_params
    params.require(:session).permit(:email, :password)
  end
end
