FROM node:18
LABEL version="1.0.0"
LABEL descripcion="Backend del orquestador de moneythor"


# Crear directorio de trabajo
WORKDIR /app

# Copiar el backend
COPY Backend/ /app/Backend/


# Instalar dependencias del backend
RUN cd /app/Backend && npm install && npm cache clean --force


# Copiar el frontend
COPY Frontend/ /app/Frontend/



# Exponer el puerto del backend
EXPOSE 3030

# Comando para iniciar Redis y el backend
CMD ["node", "/app/Backend/app.js"]
