ARG VITE_SERVER_URL

FROM node:18

# Set up a new user named "user" with user ID 1000
RUN useradd -o -u 1000 user

# Switch to the "user" user
USER user

# Set home to the user's home directory
ENV HOME=/home/user \
	PATH=/home/user/.local/bin:$PATH

# Set the working directory to the user's home directory
WORKDIR $HOME/app

# Copy the current directory contents into the container at $HOME/app setting the owner to the user
COPY --chown=user . $HOME/app

# Install npm dependencies
RUN npm install

# Build client and server
RUN export VITE_SERVER_URL=$MODEL_REPO_NAME && npm run build

# Download dataset from phsionet
RUN cd dist && mkdir data && cd data && wget -r -N -c -np -nv https://physionet.org/files/circor-heart-sound/1.0.3/

# Reset working directory
WORKDIR $HOME/app

EXPOSE 7860
CMD [ "npm", "run", "start" ]